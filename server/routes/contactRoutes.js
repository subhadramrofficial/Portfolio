import { Router } from "express";

export function createContactRouter({ controller, limiter }) {
  const router = Router();
  // Intentionally NO GET route: contact messages are never publicly listable.
  router.post("/", limiter, controller.submit);
  return router;
}
