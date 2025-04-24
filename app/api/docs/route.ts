import { NextResponse } from 'next/server';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../../lib/swagger';

export async function GET() {
  // Only enable in development

  // Convert spec to JSON string
  const specString = JSON.stringify(swaggerSpec, null, 2);
  
  // Create HTML response with Swagger UI
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>API Documentation</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css">
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
        <script>
          const spec = ${specString};
          SwaggerUIBundle({
            spec,
            dom_id: '#swagger-ui',
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIBundle.SwaggerUIStandalonePreset
            ]
          });
        </script>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}