declare module 'jsmediatags/dist/jsmediatags.min.js' {
  interface Picture {
    format: string;
    data: number[];
  }

  interface Tags {
    picture?: Picture;
  }

  interface TagResult {
    tags: Tags;
  }

  interface Callbacks {
    onSuccess: (tag: TagResult) => void;
    onError: (error: { type: string; info: string }) => void;
  }

  function read(file: Blob | string, callbacks: Callbacks): void;

  export default { read };
}
