export default function getDataByQuery(data, query) {
  const lowercaseQueryTokens = query.toLowerCase().split(/\s+/).filter(Boolean); // Split by whitespace and filter out empty tokens

  return data
    .filter((item) => {
      const lowerCaseItemName = item.name.toLowerCase();
      return lowercaseQueryTokens.every((token) =>
        lowerCaseItemName.includes(token)
      ); // Check if every token is included in the name
    })
    .slice(0, 20);
}
