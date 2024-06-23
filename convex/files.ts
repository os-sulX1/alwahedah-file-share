
import { ConvexError, v } from 'convex/values'
import { mutation, type MutationCtx, query, type QueryCtx } from './_generated/server'
import { getUser } from './users'

const hasAccessToOrg = async (ctx: MutationCtx | QueryCtx ,tokenIdentifier:string ,orgId : string ) =>{
  const user = await getUser(ctx , tokenIdentifier)


    const hasAccess = user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);

    

      if(!hasAccess){
        throw new ConvexError('you do not have access to this org')
      }

return hasAccess
}


export const createFile = mutation(
{
  args:{
   name: v.string(),
   orgId: v.string()
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity()
    if(!identity){
      throw new ConvexError('You must be logged in to perform this action !')
    }

    const hasAccess = await hasAccessToOrg(ctx, identity.tokenIdentifier , args.orgId )

    if(!hasAccess){
      throw new ConvexError('you do not have access to this org')
    }
    
      await ctx.db.insert('files',{
        name:args.name,
        orgId:args.orgId
      })
  },

}
)


export const getFiles = query({
  args:{
    orgId:v.string()
  },
   async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity()
    if(!identity){
      return []
    }
    const hasAccess = await hasAccessToOrg(ctx, identity.tokenIdentifier , args.orgId )
    if(!hasAccess){
     return []
    }
    identity.tokenIdentifier
      return ctx.db.query('files').withIndex('by_orgId',q =>
        q.eq('orgId', args.orgId)
      ).collect()
  },
})