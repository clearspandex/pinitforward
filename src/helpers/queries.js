const fields = `
{
    artifact_uri
    creator {
      address
      alias
      description
      site
      tzdomain
      twitter
    }
    description
    display_uri
    fa2 {
        active_listing
        category
        collection_id
        collection_type
        contract
        items
        metadata
        name
        path
        short_name
        type
        website
        active_auctions
        floor_price
        level
        live
        logo
        timestamp
        token_link
        twitter
        volume_24h
        volume_total
      }
    id
    mime
    metadata
    pk_id
    thumbnail_uri
    timestamp
    title
    creator_id
    extra
    flag
    fa2_id
    highest_bid
    is_signed
    last_listed
    last_metadata_update
    level
    lowest_ask
    royalties
    supply
    thresh
    token_attributes {
      attribute_id
      id
      attribute {
        id
        name
        type
        value
      }
      token_id
    }
    token_tags {
      id
      tag_id
      tag {
        id
        name
      }
      token_id
    }
  }
`;

const metadataQuery = `
  query getMetadata($id: bigint!) {
    hic_et_nunc_token_by_pk(id: $id) {
      artifact_uri
      creator {
        address
        name
      }
      id
      level
      mime
      royalties
      supply
      metadata
      timestamp
      title
      extra
    }
  }
`;

const accountQuery = `
query getCollection($address: String!, $offset: Int!) {
  token(offset: $offset, order_by: {pk_id: asc}, where: {_or: [{creator: {address: {_eq: $address}}}, {token_holders: {holder: {address: {_eq: $address}}}}]}) 
  ${fields}
}
`;

const objktQuery = `
query getObjkt($address: String!, $offset: Int!) {
    token(where: {id: {_eq: $address}}) 
    ${fields}
}
`;

const domainQuery = `
query reverseRecords($address: Address!) {
    reverseRecords(
      where: {
        address: {
          equalTo: $address
        }
      }
    ) {
      items {
        address
        owner
        domain {
          name
        }
      }
    }
  }
`;

async function graphqlQuery(url, query, variables, operationName) {
  const result = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: query,
      variables: variables,
      operationName: operationName,
    }),
  });

  return await result.json();
}

export { accountQuery, objktQuery, metadataQuery, domainQuery, graphqlQuery };
