import swaggerJSDoc from 'swagger-jsdoc';
import pkg from '../../package.json';
const { version } = pkg;

// Define the correct Options type
interface SwaggerOptions {
  definition: {
    openapi: string;
    info: {
      title: string;
      version: string;
      description: string;
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
    security?: Array<{ [key: string]: [] }>; // Note the empty array type here
  };
  apis: string[];
}

const options: SwaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Next.js API Documentation',
      version,
      description: 'API documentation for your Next.js application',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [], // Must be empty array, not string[]
      },
    ],
  },
  apis: ['./app/api/**/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;