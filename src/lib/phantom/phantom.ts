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
  // instance: Promise<phantom.PhantomJS>;
  instance: phantom.PhantomJS;
  constructor(instance: phantom.PhantomJS) {
    this.instance = instance;
  }

  static async makeInstance(){
    return new PhantomJS(await phantom.create())
  }

  async getPageProperty<T extends Property>(url: string, property: T) {
    const page = await this.instance.createPage();
    await page.open(url);
    return await page.property(property);
  }

  async getPageDocument(url: string) {
    const page = await this.instance.createPage();
    await page.open(url);
    return await page.evaluate(function () {
      return document;
    });
  }

  async getPage<T>(url: string){
    const page = await this.instance.createPage();
    await page.open(url);
    return page;
  }

  async evaluate<T>(url: string, callback: () => T) {
    const page = await this.instance.createPage();
    await page.open(url);
    return await page.evaluate(function () {
      return callback();
    });
  }
}
