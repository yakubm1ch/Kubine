export class StorageHelper {

  buildPath(bucket, file) {
    return `${bucket}/${file}`;
  }

}

export default new StorageHelper();