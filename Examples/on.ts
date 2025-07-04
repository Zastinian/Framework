import { createClient } from "@hedystia/client";
import Hedystia, { h } from "hedystia";

const app = new Hedystia()
  .onRequest((req) => {
    req.headers.set("X-Test-Header", "modified");
    return req;
  })
  .get(
    "/test-header",
    (context) => {
      return Response.json({
        headerValue: context.req.headers.get("X-Test-Header"),
      });
    },
    {
      response: h.object({
        headerValue: h.string(),
      }),
    },
  )
  .listen(3000);

const client = createClient<typeof app>("http://localhost:3000");

const { error, data } = await client["test-header"].get();

console.log(`Error: ${error}`);
console.log(`Data: ${data?.headerValue}`);

app.close();
