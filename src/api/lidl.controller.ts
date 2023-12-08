import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { PhantomJS } from 'src/lib/phantom/phantom';
import {
  Dictionary,
  MapValueType,
  ObjectValueType,
} from 'src/lib/utils/dictionary';
import {
  Filter,
  FilterObjectDiscrimination,
  FilterObjectUnion,
  courses,
  regions,
} from 'src/lib/vendor/lidl/filter';
import { availableParallelism } from 'os';
import path from 'path';
import { Pool, Thread, Worker, spawn } from 'threads';
import { RecipeFunctions } from 'src/lib/utils/workers/recipes';

export type Recipe = {
  name: string;
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
  @Get(':f')
  public async filters(
    @Query(new ValidationPipe({ transform: true }))
    f: CategoryFilter<ObjectValueType<FilterObjectDiscrimination>>,
  ) {
    const uri_arr = [];
    const conditions: boolean[] = [false, false];
    for (const item of f.filters) {
      if (item in Dictionary.reverseObject(courses)) {
        conditions[0] = true;
      } else if (item in Dictionary.reverseObject(regions)) {
        conditions[1] = true;
      }
    }
    if (conditions[0]) {
      uri_arr.push(
        this._makeFilter('course', courses as any, new Set(f.filters)),
      );
    }
    if (conditions[1]) {
      uri_arr.push(
        this._makeFilter('region', regions as any, new Set(f.filters)),
      );
    }
    const url = this.url + this._consolidateFilters(uri_arr);
    const hrefs = await this._getHrefs(url);
    return await this._getRecipes(hrefs);
  }

  private async _getHrefs(url: string) {
    console.log('Looking for hrefs...');
    const phantom = new PhantomJS();
    const page = await phantom.getPage(url);
    return await page.evaluate(function () {
      // This code looks atypical since PhantomJS only supports ES5 standards.
      var anchors = document.querySelectorAll('.mRecipeTeaser-link');
      var hrefs: string[] = [];
      for (var i = 0; i < anchors.length; i++) {
        hrefs.push(anchors[i].getAttribute('href'));
      }
      console.log('hrefs', hrefs);
      return hrefs;
    });
  }

  private async _getRecipes(hrefs: string[]) {
    console.log(hrefs);
    const worker_pool = Pool(
      () => spawn<RecipeFunctions>(new Worker('../lib/utils/workers/recipes')),
      2,
    );
    // const worker = await spawn<RecipeFunctions>(new Worker("../lib/utils/workers/recipes"));
    const ret = new Promise<
      Awaited<ReturnType<RecipeFunctions['getRecipe']>>[]
    >(async (resolve, reject) => {
      const recipes: Awaited<typeof ret> = [];
      for (const href of hrefs) {
        worker_pool
          .queue((worker) => worker.getRecipe(href))
          .then((result) => recipes.push(result));
        // recipes.push(await worker.getRecipe(this.url + href));
        // const url = this.url + href;
        // const phantom = new PhantomJS();
        // const page = await phantom.getPage(url);
        // const recipe = await page.evaluate(function () {
        //   return JSON.parse(document.querySelector('script[class="json-ld"]').innerHTML)
        // });
        // const parsed: Recipe = {
        //   name: recipe.name,
        //   ingredients: recipe.recipeIngredient,
        //   instructions: recipe.recipeInstructions
        // }
        // console.log(parsed);
        // recipes.push(parsed);
      }
      if (recipes.length > 0) resolve(recipes);
    });
    const p = await ret
      .then((data) => {console.log('Completed.'); return data;})
      .catch((err) => console.error(err));
    await worker_pool.completed();
    await worker_pool.terminate();
    return p;
  }
}
