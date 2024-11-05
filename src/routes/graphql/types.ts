import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { PrismaClient } from '@prisma/client';

export const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});

export const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: { type: new GraphQLNonNull(MemberTypeId) },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

export const Post = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export const Profile = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberType: {
      type: new GraphQLNonNull(MemberType),
      resolve: async (
        profile: { memberTypeId: string },
        _,
        { prisma }: { prisma: PrismaClient },
      ) => await prisma.memberType.findFirst({ where: { id: profile.memberTypeId } }),
    },
  },
});

export const User: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: Profile,
      resolve: async (user: { id: string }, _, { prisma }: { prisma: PrismaClient }) =>
        await prisma.profile.findFirst({ where: { userId: user.id } }),
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
      resolve: async (user: { id: string }, _, { prisma }: { prisma: PrismaClient }) =>
        await prisma.post.findMany({ where: { authorId: user.id } }),
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (user: { id: string }, _, { prisma }: { prisma: PrismaClient }) => {
        const subscribes = await prisma.subscribersOnAuthors.findMany({
          where: { subscriberId: user.id },
        });

        return subscribes.map(
          async ({ authorId }) =>
            await prisma.user.findFirst({ where: { id: authorId } }),
        );
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (user: { id: string }, _, { prisma }: { prisma: PrismaClient }) => {
        const subscribes = await prisma.subscribersOnAuthors.findMany({
          where: { authorId: user.id },
        });

        return subscribes.map(
          async ({ subscriberId }) =>
            await prisma.user.findFirst({ where: { id: subscriberId } }),
        );
      },
    },
  }),
});
