declare module 'swagger-jsdoc' {
    interface Options {
      definition: {
        openapi: string;
        info: {
          title: string;
          version: string;
          description?: string;
        };
        components?: {
          securitySchemes?: {
            [key: string]: {
              type: string;
              scheme: string;
              bearerFormat?: string;
            };
          };
        };
        security?: Array<{ [key: string]: [] }>;
      };
      apis: string[];
    }
  
    function swaggerJSDoc(options: Options): any;
    export = swaggerJSDoc;
  }