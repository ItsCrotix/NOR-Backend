import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "v1.0.0",
    title: "NOR Racing API",
    description: "Implementation of Swagger with TypeScript",
  },
  servers: [
    {
      url: "https://nor-backend.onrender.com/",
      description: "",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const outputFile = "../src/swagger_output.json";
const endpointsFiles = ["../src/index.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
