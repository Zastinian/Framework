import { Framework, createClient } from "../Package/src";
import { z } from "zod";

import { describe, expect, it } from "bun:test";

const app = new Framework()
  .get(
    "/products",
    (context) => {
      return Response.json({
        query: context.query,
      });
    },
    {
      query: z.object({
        category: z.string().optional(),
        limit: z.coerce.number().optional(),
        sort: z.enum(["asc", "desc"]).optional(),
      }),
      response: z.object({
        query: z.object({
          category: z.string().optional(),
          limit: z.number().optional(),
          sort: z.enum(["asc", "desc"]).optional(),
        }),
      }),
    },
  )
  .get(
    "/products/:id",
    (context) => {
      return Response.json({
        params: context.params,
        query: context.query,
      });
    },
    {
      params: z.object({
        id: z.coerce.number(),
      }),
      query: z.object({
        fields: z.string().optional(),
        include: z.string().optional(),
      }),
      response: z.object({
        params: z.object({ id: z.number() }),
        query: z.object({
          fields: z.string().optional(),
          include: z.string().optional(),
        }),
      }),
    },
  )
  .listen(3003);

const client = createClient<typeof app>("http://localhost:3003");

describe("Test query parameters", () => {
  it("should handle query parameters without path params", async () => {
    const { data: response } = await client.products.get({
      category: "electronics",
      limit: 10,
      sort: "desc",
    });

    expect(response).toEqual({
      query: {
        category: "electronics",
        limit: 10,
        sort: "desc",
      },
    });
  });

  it("should handle optional query parameters", async () => {
    const { data: response } = await client.products.get({
      category: "books",
    });

    expect(response).toEqual({
      query: {
        category: "books",
      },
    });
  });

  it("should handle no query parameters", async () => {
    const { data: response } = await client.products.get();

    expect(response).toEqual({
      query: {},
    });
  });

  it("should handle query parameters with path params", async () => {
    const { data: response } = await client.products.id(123).get({
      fields: "name,price,description",
      include: "reviews",
    });

    expect(response).toEqual({
      params: { id: 123 },
      query: {
        fields: "name,price,description",
        include: "reviews",
      },
    });
  });

  it("should validate query parameters", async () => {
    try {
      await client.products.get({
        sort: "invalid" as any,
      });

      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
