import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLScalarType,
  Kind,
} from 'graphql';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const schema = getSchema(prisma);

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      return graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables,
      });
    },
  });
};

function getSchema(prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) {
  const UUID = new GraphQLScalarType({
    name: 'UUID',
    description: 'A custom scalar type representing a UUID.',
    serialize(value) {
      if (
        typeof value !== 'string' ||
        !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          value,
        )
      ) {
        throw new Error('Invalid UUID format');
      }
      return value;
    },
    parseValue(value) {
      if (
        typeof value !== 'string' ||
        !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          value,
        )
      ) {
        throw new Error('Invalid UUID format');
      }
      return value;
    },
    parseLiteral(ast) {
      if (
        ast.kind === Kind.STRING &&
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          ast.value,
        )
      ) {
        return ast.value;
      }
      throw new Error('Invalid UUID format');
    },
  });

  const MemberTypeId = new GraphQLEnumType({
    name: 'MemberTypeId',
    values: {
      BASIC: { value: 'BASIC' },
      BUSINESS: { value: 'BUSINESS' },
    },
  });

  const MemberType = new GraphQLObjectType({
    name: 'MemberType',
    fields: {
      id: { type: new GraphQLNonNull(MemberTypeId) },
      discount: { type: new GraphQLNonNull(GraphQLFloat) },
      postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
    },
  });

  const Post = new GraphQLObjectType({
    name: 'Post',
    fields: {
      id: { type: new GraphQLNonNull(UUID) },
      title: { type: new GraphQLNonNull(GraphQLString) },
      content: { type: new GraphQLNonNull(GraphQLString) },
    },
  });

  const Profile = new GraphQLObjectType({
    name: 'Profile',
    fields: {
      id: { type: new GraphQLNonNull(UUID) },
      isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
      yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
      memberType: { type: new GraphQLNonNull(MemberType) },
    },
  });

  const User: GraphQLObjectType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: { type: new GraphQLNonNull(UUID) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      balance: { type: new GraphQLNonNull(GraphQLFloat) },
      profile: { type: Profile },
      posts: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))) },
      userSubscribedTo: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      },
      subscribedToUser: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      },
    }),
  });

  const RootQueryType = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      memberTypes: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
        resolve: async () => await prisma.memberType.findMany(),
      },
      memberType: {
        type: MemberType,
        args: {
          id: { type: new GraphQLNonNull(MemberTypeId) },
        },
        resolve: async (_, { id }: { id: string }) =>
          await prisma.memberType.findFirst({ where: { id } }),
      },
      users: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
        resolve: async () => await prisma.user.findMany(),
      },
      user: {
        type: User,
        args: {
          id: { type: new GraphQLNonNull(UUID) },
        },
        resolve: async (_, { id }: { id: string }) =>
          await prisma.user.findFirst({ where: { id } }),
      },
      posts: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
        resolve: async () => await prisma.post.findMany(),
      },
      post: {
        type: Post,
        args: {
          id: { type: new GraphQLNonNull(UUID) },
        },
        resolve: async (_, { id }: { id: string }) =>
          await prisma.post.findFirst({ where: { id } }),
      },
      profiles: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Profile))),
        resolve: async () => await prisma.profile.findMany(),
      },
      profile: {
        type: Profile,
        args: {
          id: { type: new GraphQLNonNull(UUID) },
        },
        resolve: async (_, { id }: { id: string }) =>
          await prisma.profile.findFirst({ where: { id } }),
      },
    },
  });

  const schema = new GraphQLSchema({
    query: RootQueryType,
  });

  return schema;
}

export default plugin;
