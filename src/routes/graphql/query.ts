import { PrismaClient } from '@prisma/client';
import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberType, MemberTypeId, Post, Profile, User } from './types.js';

export const query = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
      resolve: async (_, __, { prisma }: { prisma: PrismaClient }) =>
        await prisma.memberType.findMany(),
    },

    memberType: {
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(MemberTypeId) },
      },
      resolve: async (_, { id }: { id: string }, { prisma }: { prisma: PrismaClient }) =>
        await prisma.memberType.findFirst({ where: { id } }),
    },

    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (_, __, { prisma }: { prisma: PrismaClient }) =>
        await prisma.user.findMany(),
    },

    user: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, { prisma }: { prisma: PrismaClient }) =>
        await prisma.user.findFirst({ where: { id } }),
    },

    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
      resolve: async (_, __, { prisma }: { prisma: PrismaClient }) =>
        await prisma.post.findMany(),
    },

    post: {
      type: Post,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, { prisma }: { prisma: PrismaClient }) =>
        await prisma.post.findFirst({ where: { id } }),
    },

    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Profile))),
      resolve: async (_, __, { prisma }: { prisma: PrismaClient }) =>
        await prisma.profile.findMany(),
    },

    profile: {
      type: Profile,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, { prisma }: { prisma: PrismaClient }) =>
        await prisma.profile.findFirst({ where: { id } }),
    },
  },
});
