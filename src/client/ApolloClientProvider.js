'use client';

import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';

const client = new ApolloClient({
  link: new HttpLink({
    uri: '/api/graphql', // GraphQL 엔드포인트
    credentials: 'include', // ✅ NextAuth 세션 쿠키 전달
  }),
  cache: new InMemoryCache(),
});

function ApolloClientProvider({ children, client: providedClient }) {
  return (
    <ApolloProvider client={providedClient || client}>
      {children}
    </ApolloProvider>
  );
}

export { client, ApolloClientProvider };
