import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payloadString = await request.text();
      const headerPayload = request.headers;

      // Check if required headers are present
      const svixId = headerPayload.get("svix-id");
      const svixTimestamp = headerPayload.get("svix-timestamp");
      const svixSignature = headerPayload.get("svix-signature");

      if (!svixId || !svixTimestamp || !svixSignature) {
        throw new Error("Missing required headers");
      }

      const result = await ctx.runAction(internal.clerk.fulfill, {
        payload: payloadString,
        headers: {
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        },
      });

      switch (result.type) {
        case "user.created":
          await ctx.runMutation(internal.users.createUser, {
            tokenIdentifier: `https://adjusted-foal-83.clerk.accounts.dev|${result.data.id}`,
          });
          break;
        case "organizationMembership.created":
          await ctx.runMutation(internal.users.addOrgIdToUser, {
            tokenIdentifier: `https://adjusted-foal-83.clerk.accounts.dev|${result.data.public_user_data.user_id}`,
            orgId: result.data.organization.id,
            role: result.data.role === "admin" ? "admin" : "member",
          });
          break;
        case "organizationMembership.updated":
          console.log(result.data.role);
          await ctx.runMutation(internal.users.updateRoleInOrgForUser, {
            tokenIdentifier: `https://adjusted-foal-83.clerk.accounts.dev|${result.data.public_user_data.user_id}`,
            orgId: result.data.organization.id,
            role: result.data.role === "org:admin" ? "admin" : "member",
          });
          break;
        default:
          console.warn("Unhandled result type:", result.type);
      }

      return new Response(null, { status: 200 });
    } catch (err) {
      console.error("Error handling webhook:", err);
      return new Response(`Webhook Error: ${err}`, { status: 400 });
    }
  }),
});

export default http;
