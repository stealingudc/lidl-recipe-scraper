import { Recipe } from 'src/api/lidl.controller';
import { PhantomJS } from 'src/lib/phantom/phantom';
import { expose } from 'threads/worker';

const ph = (async () => await PhantomJS.makeInstance())();

export async function getRecipe(url: string) {
  try {
    const phantom = await ph;
    console.log(`Getting "${url}"...`);
    const page = await phantom.getPage(url);
    await page.setting(
      'userAgent',
      'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:25.0) Gecko/20100101 Firefox/29.0',
    );
    await page.setting('resourceTimeout', function (error) {
      console.log(error);
    });
    const err = await page.on('onError', function (error) {
      return error;
    });
    if (err) console.log(err);
    await page.open(url);
    const object = await page.evaluate(function () {
      var doc = document.documentElement;
      if (doc) {
        console.log('Loaded and found HTML.');
        var script = doc.querySelector('.json-ld');
        if (script) {
          return JSON.parse(script.innerHTML);
        }
      }
    });
    await page.close();
    return object
      ? {
          name: object.name,
          description: object.description,
          ingredients: object.recipeIngredient,
          instructions: JSON.stringify(object.recipeInstructions).replaceAll("\\n", " "),
        }
      : {};
  } catch (err) {
    console.log(err);
  }
}

expose(getRecipe);

// expose({getRecipe});
