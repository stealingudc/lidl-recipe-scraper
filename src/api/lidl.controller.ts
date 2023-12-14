import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { PhantomJS } from 'src/lib/phantom/phantom';
import {
  Dictionary,
  ObjectValueType,
} from 'src/lib/utils/dictionary';
import {
  Filter,
  FilterObjectDiscrimination,
  FilterObjectUnion,
  filterAccessors,
  filters,
} from 'src/lib/vendor/lidl/filter';
import { FunctionThread, Pool, Worker, spawn } from 'threads';
import { QueuedTask } from 'threads/dist/master/pool-types';
import { performance } from 'perf_hooks';
import { ApiQuery } from '@nestjs/swagger';

export type Recipe = {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
};

export class CategoryFilter<T> {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform(({ value }: { value: string }) => value.split(','))
  filters: T[];
}

export type GetRecipeType = (url: string) => Promise<Recipe>;

@Controller('api')
export class LidlController {
  public url = 'https://www.bucataria.lidl.ro';
  constructor() {}

  private _consolidateFilters(filters: string[]) {
    var filter: string = '';
    for (const f of filters) {
      filter += f;
    }
    return filter.replace('&', '?');
  }

  private _makeFilter<T extends ObjectValueType<FilterObjectUnion>>(
    type: Filter,
    obj: FilterObjectDiscrimination,
    query: Set<T>,
  ) {
    var filter = `&filters[${type}]=`;
    const dict = Dictionary.reverseObject(obj);
    for (const value of query) {
      if (dict[value]) {
        if (Array.from(query).indexOf(value) === 0) {
          filter = filter + dict[value].toString();
        } else {
          filter = filter + `%2C+${dict[value]}`;
        }
      }
    }
    return filter;
  }

  //Example: http://localhost:3000/api/get?filters=breakfast,brunch
  @ApiQuery({type: [() => (filters)]})
  @Get(':f')
  public async filters(
    @Query(new ValidationPipe({ transform: true }))
    f: CategoryFilter<ObjectValueType<FilterObjectDiscrimination>>,
  ) {
    console.log('Started working...');
    const uri_arr = [];
    var found: string = '';

    for (const item of f.filters) {
      for (var i = 0; i < filters.length; i++) {
        if (item in Dictionary.reverseObject(filters[i] as any)) {
          found = found + '"' + filterAccessors[i] + '"' + ', ';
          uri_arr.push(
            this._makeFilter(
              filterAccessors[i],
              filters[i] as any,
              new Set(f.filters),
            ),
          );
        }
      }
    }

    console.log(`Found filters: ${found.slice(0, found.length - 2)}.`);
    const url = this.url + this._consolidateFilters(uri_arr);
    const hrefs = await this._getHrefs(url);
    console.log(`Found ${hrefs.length} recipes.`);
    return await this._getRecipes(hrefs);
  }

  private async _getHrefs(url: string) {
    // console.log('Looking for hrefs...');
    const phantom = await PhantomJS.makeInstance();
    const page = await phantom.getPage(url);
    const hrefs = await page.evaluate(function () {
      // This code looks atypical since PhantomJS only supports ES5 standards.
      var container = document.querySelector(
        '.oRecipeFeed-resultContainer.js_oRecipeFeed-resultContainer',
      );
      var anchors = container.querySelectorAll('.mRecipeTeaser-link');
      var hrefs: string[] = [];
      for (var i = 0; i < anchors.length; i++) {
        hrefs.push(anchors[i].getAttribute('href'));
      }
      console.log('hrefs', hrefs);
      return hrefs;
    });
    page.close();
    return hrefs;
  }

  private async _getRecipes(hrefs: string[]) {
    const worker_pool = Pool(() =>
      spawn<GetRecipeType>(new Worker('../lib/utils/workers/recipes')),
    );
    const tasks: QueuedTask<FunctionThread, Recipe>[] = [];
    var recipes = [];
    if (hrefs.length > 0) {
      for (const href of hrefs) {
        const task = worker_pool.queue(async (getRecipe) => {
          const recipe = await getRecipe(this.url + href);
          return recipe;
        });
        tasks.push(task);
      }
    }
    recipes = [...(await Promise.all(tasks))];
    console.log(`Done working in ${performance.now()}ms.`);
    return recipes;
  }
}
