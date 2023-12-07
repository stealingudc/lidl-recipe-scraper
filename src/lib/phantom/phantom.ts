import * as phantom from 'phantom';

type Property =
  | 'content'
  | 'plainText'
  | 'focusedFrameName'
  | 'frameContent'
  | 'frameName'
  | 'framePlainText'
  | 'frameTitle'
  | 'libraryPath'
  | 'offlineStoragePath'
  | 'title'
  | 'url'
  | 'windowName';

export class PhantomJS {
  instance: Promise<phantom.PhantomJS>;
  constructor() {
    this.instance = phantom.create();
  }

  async getPageProperty<T extends Property>(url: string, property: T) {
    const page = await (await this.instance).createPage();
    await page.open(url);
    return await page.property(property);
  }

  async getPageDocument(url: string){
    const page = await (await this.instance).createPage();
    await page.open(url);
    return await page.evaluate(() => document);
  }
}
