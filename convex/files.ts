import { ConvexError, v } from 'convex/values'
import { internalMutation, mutation, type MutationCtx, query, type QueryCtx } from './_generated/server'
import { fileTypes } from './schema'
import type { Doc, Id } from './_generated/dataModel'

export const generateUploadUrl =mutation(async (ctx) =>{
  const identity = await ctx.auth.getUserIdentity()
  if(!identity){
    throw new ConvexError('You must be logged in to upload the file !')
    
  }
  return await ctx.storage.generateUploadUrl()

})




const hasAccessToOrg = async (ctx: MutationCtx | QueryCtx  ,orgId : string ) =>{
  const identity = await ctx.auth.getUserIdentity()
  if(!identity){
    throw null
  }
const user =await ctx.db.query('users').withIndex('by_tokenIdentifier',q => q.eq('tokenIdentifier' , identity.tokenIdentifier)).first()
if(!user){
  return null
}
    const hasAccess = user.orgIds.some(item => item.orgId === orgId) || user.tokenIdentifier.includes(orgId);

      if(!hasAccess){
        throw null
      }

return {user}
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

    const hasAccess = await hasAccessToOrg(ctx , args.orgId )

    if(!hasAccess){
      throw new ConvexError('you do not have access to this org')
    }
    
      await ctx.db.insert('files',{
        name:args.name,
        fileId:args.fileId,
        orgId:args.orgId,
        type:args.type,
        userId:hasAccess.user._id
      })
  },

}
)


export const getFiles = query({
  args:{
    orgId:v.string(),
    query:v.optional(v.string()),
    favorites:v.optional(v.boolean()),
    deletedOnly:v.optional(v.boolean()),
    type:v.optional(fileTypes)
  },
   async handler(ctx, args) {
    
    
    const identity = await ctx.auth.getUserIdentity()
    if(!identity){
      return []
    }
    const hasAccess = await hasAccessToOrg(ctx,  args.orgId )
    if(!hasAccess){
     return []
    }
    let files = await ctx.db.query('files').withIndex('by_orgId',(q) =>q.eq('orgId' ,args.orgId)).collect()
       
      const query= args.query

      if(query){
        files= (await files).filter((file)=> file.name.toLowerCase().includes(query.toLowerCase()))
      }
        if(args.favorites){
          const favorites = await ctx.db.query('favorites').withIndex('by_userId_fileId_orgId',q=>q.eq('userId',hasAccess.user._id).eq('orgId',args.orgId)).collect()
          files = files.filter(file => favorites.some((favorite) => favorite.fileId === file._id))
        }
        if(args.deletedOnly){
          files = files.filter(file => file.shouldDelete)
        }else if(!args.deletedOnly){
          files = files.filter(file => !file.shouldDelete)
        }

        if(args.type){
          files = files.filter(file => file.type === args.type)
        }
        return files
      
  },
})
export const deleteAllFiles = internalMutation({
  args:{} ,
  async handler(ctx, args) {
   
    const files = await ctx.db.query('files').withIndex('by_shouldDelete' , q=>q.eq('shouldDelete',true)).collect()
    await Promise.all(files.map(  async(file)=>{
      await ctx.storage.delete(file.fileId)
      return await ctx.db.delete(file._id)
    }))
 },

})

export const deleteFile = mutation({
  args:{fileId: v.id('files')} ,
   async handler(ctx, args) {
    const hasAccess = await hasAccessToFile(ctx , args.fileId)

    if(!hasAccess){
      return new ConvexError('No access to a file')
    }

    canDeleteFile(hasAccess.user , hasAccess.file)

  
      await ctx.db.patch(args.fileId,{
        shouldDelete:true})
    
    

  },

})

export const restoreFile = mutation({
  args:{fileId: v.id('files')} ,
   async handler(ctx, args) {
    const hasAccess = await hasAccessToFile(ctx , args.fileId)

    if(!hasAccess){
      return new ConvexError('No access to a file')
    }


    canDeleteFile(hasAccess.user , hasAccess.file)

    
      await ctx.db.patch(args.fileId,{
        shouldDelete:false
      })
    
    

  },

})

const canDeleteFile =(user:Doc<'users'>,file:Doc<'files'>)=>{
  const canDelete = file.userId ===user._id ||
  user.orgIds.find((org)=>org.orgId === file.orgId)?.role=== 'admin'

  if(!canDelete)  {
    throw new ConvexError('you have no access admin to delete')
    }
}

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







export const toggleFavorite =  mutation({
  args:{fileId: v.id('files')} ,
   async handler(ctx, args) {
    const hasAccess = await hasAccessToFile(ctx , args.fileId)

    if(!hasAccess?.file || !hasAccess.user){
      return new ConvexError('No access to a file')
    }
    const favorite = await ctx.db.query('favorites').withIndex('by_userId_fileId_orgId',(q)=>
      q.eq('userId',hasAccess.user._id ).eq('orgId',hasAccess.file.orgId).eq('fileId',hasAccess.file._id)).first()

    if(!favorite){
      await ctx.db.insert('favorites',{
        fileId:hasAccess.file._id,
        userId:hasAccess.user._id  ,
        orgId:hasAccess.file.orgId,
      })
    }else{
      await ctx.db.delete(favorite._id)
    }

  },
})

export const getAllFavorites =  query({
  args:{orgId: v.string()} ,
   async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity()
    if(!identity){
      throw new ConvexError('You must be logged in to perform this action !')
    }

    const hasAccess = await hasAccessToOrg(ctx , args.orgId)

    if(!hasAccess){
      return [ ]
    }
    const favorites = await ctx.db.query('favorites')
    .withIndex('by_userId_fileId_orgId', q=>q.eq('userId',hasAccess.user._id).eq('orgId',args.orgId)).collect()
    return favorites
  },
})





const hasAccessToFile = async (ctx :QueryCtx |MutationCtx , fileId:Id<'files'> )=>{
  
  const file = await ctx.db.get(fileId)
  if(!file){
    return null
  }
  const hasAccess = await hasAccessToOrg(ctx, file.orgId  )
  if(!hasAccess){
    return null
  }
 

  return {user: hasAccess.user,file }
}

