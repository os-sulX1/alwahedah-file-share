
import { ConvexError, v } from 'convex/values'
import { mutation, type MutationCtx, query, type QueryCtx } from './_generated/server'
import { getUser } from './users'
import { fileTypes } from './schema'
import { Id } from './_generated/dataModel'

export const generateUploadUrl =mutation(async (ctx) =>{
  const identity = await ctx.auth.getUserIdentity()
  if(!identity){
    throw new ConvexError('You must be logged in to upload the file !')
    
  }
  return await ctx.storage.generateUploadUrl()

})




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
   fileId:v.id('_storage'),
   orgId: v.string(),
   type:fileTypes
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
        fileId:args.fileId,
        orgId:args.orgId,
        type:args.type,
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

export const deleteFile = mutation({
  args:{fileId: v.id('files')} ,
   async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity()
    if(!identity){
      throw new ConvexError('you do not have access to this delete this file')
    }
    const file = await ctx.db.get(args.fileId)
    if(!file){
      throw new ConvexError('this file dose not exist')
    }
    const hasAccess = await hasAccessToOrg(ctx, identity.tokenIdentifier , file.orgId  )
    if(!hasAccess){
      throw new Error
    }

    await ctx.db.delete(args.fileId)
  },

})

export const getFilesImageURL = query({
  args:{
    fileId:v.id('_storage')
  },
   async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity()
    if(!identity){
      return []
    }
      return await ctx.storage.getUrl(args.fileId)

  },
})




