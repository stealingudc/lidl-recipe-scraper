import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
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
  public filters(
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
    return this.url + this._consolidateFilters(uri_arr);
  }
}
