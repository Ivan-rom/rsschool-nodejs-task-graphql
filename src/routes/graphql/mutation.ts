import {
  ChangePostInput,
  ChangeProfileInput,
  ChangeUserInput,
  CreatePostInput,
  CreateProfileInput,
  CreateUserInput,
} from './inputs.js';
import { PrismaClient } from '@prisma/client';
import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { UUIDType } from './types/uuid.js';
import { Post, Profile, User } from './types.js';

export const mutation = new GraphQLObjectType({
  name: 'Mutations',
  fields: {
    createUser: {
      type: new GraphQLNonNull(User),
      args: {
        dto: { type: new GraphQLNonNull(CreateUserInput) },
      },
      resolve: async (
        _,
        { dto }: { dto: { name: string; balance: number } },
        { prisma }: { prisma: PrismaClient },
      ) => await prisma.user.create({ data: dto }),
    },

    createProfile: {
      type: new GraphQLNonNull(Profile),
      args: {
        dto: { type: CreateProfileInput },
      },
      resolve: async (
        _,
        {
          dto,
        }: {
          dto: {
            isMale: boolean;
            yearOfBirth: number;
            userId: string;
            memberTypeId: string;
          };
        },
        { prisma }: { prisma: PrismaClient },
      ) => await prisma.profile.create({ data: dto }),
    },

    createPost: {
      type: new GraphQLNonNull(Post),
      args: {
        dto: { type: new GraphQLNonNull(CreatePostInput) },
      },
      resolve: async (
        _,
        {
          dto,
        }: {
          dto: {
            title: string;
            content: string;
            authorId: string;
          };
        },
        { prisma }: { prisma: PrismaClient },
      ) => await prisma.post.create({ data: dto }),
    },

    changePost: {
      type: new GraphQLNonNull(Post),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      resolve: async (
        _,
        { id, dto }: { id: string; dto: { title: string; content: string } },
        { prisma }: { prisma: PrismaClient },
      ) => await prisma.post.update({ where: { id }, data: dto }),
    },

    changeProfile: {
      type: new GraphQLNonNull(Profile),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) },
      },
      resolve: async (
        _,
        {
          id,
          dto,
        }: {
          id: string;
          dto: { isMale: boolean; yearOfBirth: number; memberTypeId: string };
        },
        { prisma }: { prisma: PrismaClient },
      ) => await prisma.profile.update({ where: { id }, data: dto }),
    },

    changeUser: {
      type: new GraphQLNonNull(User),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: async (
        _,
        { id, dto }: { id: string; dto: { name: string; balance: number } },
        { prisma }: { prisma: PrismaClient },
      ) => await prisma.user.update({ where: { id }, data: dto }),
    },

    deleteUser: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _,
        { id }: { id: string },
        { prisma }: { prisma: PrismaClient },
      ) => {
        await prisma.user.delete({ where: { id } });
        return 'User deleted';
      },
    },

    deletePost: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _,
        { id }: { id: string },
        { prisma }: { prisma: PrismaClient },
      ) => {
        await prisma.post.delete({ where: { id } });
        return 'Post deleted';
      },
    },

    deleteProfile: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _,
        { id }: { id: string },
        { prisma }: { prisma: PrismaClient },
      ) => {
        await prisma.profile.delete({ where: { id } });
        return 'Profile deleted';
      },
    },

    subscribeTo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _,
        { userId, authorId }: { userId: string; authorId: string },
        { prisma }: { prisma: PrismaClient },
      ) => {
        await prisma.subscribersOnAuthors.create({
          data: { subscriberId: userId, authorId },
        });

        return 'Subscribed';
      },
    },

    unsubscribeFrom: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _,
        { userId, authorId }: { userId: string; authorId: string },
        { prisma }: { prisma: PrismaClient },
      ) => {
        await prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: userId,
              authorId,
            },
          },
        });

        return 'Subscribed';
      },
    },
  },
});
