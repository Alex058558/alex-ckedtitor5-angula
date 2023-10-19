
export default class Adapter {
    loader;
    reader: any;
    config;
    constructor(loader: any, config: any) {
      this.loader = loader;
      this.config = config;
    }
  
  
  public async upload(): Promise<any> {
    const value = await this.loader.file;
    console.log(value);
        return this.read( value);
      }
  
    read(file: Blob) {
      console.log(file);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
  
        reader.onload = function () {
          resolve({ default: reader.result });
        };
  
        reader.onerror = function (error) {
          reject(error);
        };
  
        reader.onabort = function () {
          reject();
        };
        reader.readAsDataURL(file);
      });
    }
  
    abort() {
      if (this.reader) {
        this.reader.abort();
      }
    }
  }
  
  