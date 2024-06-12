import React, { useState } from "react";
import { Container, Input, Button, VStack, HStack, Box, Text, Spinner, useToast } from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import axios from "axios";

const Index = () => {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const toast = useToast();

  const handleSearch = async () => {
    setLoading(true);
    try {
      const zoteroResponse = await axios.get(`https://api.zotero.org/users/YOUR_USER_ID/items`, {
        params: {
          q: query,
          format: "json",
          v: 3,
        },
      });
      setArticles(zoteroResponse.data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error fetching articles",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  const handleArticleClick = async (article) => {
    setSelectedArticle(article);
    try {
      const semanticResponse = await axios.get(`https://api.semanticscholar.org/v1/paper/${article.key}`);
      setSelectedArticle({ ...article, semanticData: semanticResponse.data });
    } catch (error) {
      toast({
        title: "Error fetching additional information",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container centerContent maxW="container.md" py={8}>
      <VStack spacing={4} width="100%">
        <HStack width="100%">
          <Input placeholder="Search for articles" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button onClick={handleSearch} leftIcon={<FaSearch />} colorScheme="teal">
            Search
          </Button>
        </HStack>
        {loading && <Spinner />}
        <VStack spacing={4} width="100%">
          {articles.map((article) => (
            <Box key={article.key} p={4} borderWidth="1px" borderRadius="md" width="100%" onClick={() => handleArticleClick(article)} cursor="pointer">
              <Text fontSize="lg" fontWeight="bold">
                {article.data.title}
              </Text>
              <Text>{article.data.creators.map((creator) => creator.lastName).join(", ")}</Text>
            </Box>
          ))}
        </VStack>
        {selectedArticle && (
          <Box p={4} borderWidth="1px" borderRadius="md" width="100%" mt={4}>
            <Text fontSize="2xl" fontWeight="bold">
              {selectedArticle.data.title}
            </Text>
            <Text>{selectedArticle.data.creators.map((creator) => creator.lastName).join(", ")}</Text>
            {selectedArticle.semanticData && (
              <Box mt={4}>
                <Text fontSize="lg" fontWeight="bold">
                  Additional Information from Semantic Scholar
                </Text>
                <Text>Citations: {selectedArticle.semanticData.citationCount}</Text>
                <Text>Influential Citations: {selectedArticle.semanticData.influentialCitationCount}</Text>
              </Box>
            )}
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default Index;
