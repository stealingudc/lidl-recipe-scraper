import { Recipe } from 'src/api/lidl.controller';
import { PhantomJS } from 'src/lib/phantom/phantom';
import { expose } from 'threads/worker';

const functions = {
  async getRecipe(url: string): Promise<Recipe> {
    console.log('Hello world');
    const phantom = new PhantomJS();
    const page = await phantom.getPage(url);
    const recipe = await page.evaluate(function () {
      return JSON.parse(
        document.querySelector('script[class="json-ld"]').innerHTML,
      );
    });
    return recipe
      ? {
          name: recipe.name,
          ingredients: recipe.recipeIngredient,
          instructions: recipe.recipeInstructions,
        }
      : ({} as Recipe);
  },
};

export type RecipeFunctions = typeof functions;

expose(functions);
