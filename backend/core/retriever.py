from collections import defaultdict

class HybridRetriever:
      def __init__(self, chunks, vector_store, bm25, top_k = 10):
            self.chunks = chunks
            self.vector_store = vector_store
            self.bm25 = bm25
            self.top_k = top_k


            #CONTENT -> INDEX MAPPING 
            self.content_to_index = {
                  doc.page_content : i
                  for i, doc in enumerate(chunks)
            }

      # def normalize(self, scores):
      #       max_score = max(scores)
      #       min_score = min(scores)

      #       if max_score - min_score == 0:
      #             return [1 for _ in scores]
            
      #       return [(s - min_score)/(max_score - min_score) for s in scores]

      def retrieve(self, query):


            RRF_K = 10
            BM25_WEIGHT = 1.2
            SEMANTIC_WEIGHT = 1.0
            CANDIDATE_POOL = 20

            #========SEMANTIC SEARCH========
            semantic_results = self.vector_store.similarity_search_with_score(query, CANDIDATE_POOL)

            semantic_docs = [doc for doc, _ in semantic_results]
            semantic_indicies = [self.content_to_index[doc.page_content] for doc in semantic_docs]
            
                  
            
            #=======BM25 SEARCH======
            tokenized_query = query.split()
            bm25_scores = self.bm25.get_scores(tokenized_query)

            top_indices = sorted(
                  range(len(bm25_scores)),
                  key = lambda i: bm25_scores[i],
                  reverse=True
            )[:CANDIDATE_POOL]

            # keyword_docs = [self.chunks[i] for i in top_indices]
            

            # #======NORMALIZE=======
            # normal_semantic = self.normalize(semantic_scores) if semantic_scores else []
            # normal_keyword = self.normalize(keyword_scores) if keyword_scores else []


            # #=======Weighted Fusion=======
            # alpha = 0.7
            # beta = 0.3

            # final_scores = {}

            # #SEMANTIC  CONTRIBUTION
            # for  i,doc in enumerate(semantic_docs):
            #       final_scores[doc.page_content] = alpha * normal_semantic[i]

            # #KEYWORD CONTRIBUTION
            # for  i, doc in enumerate(keyword_docs):
            #       content = doc.page_content
            #       score = beta * normal_keyword[i]

            #       if content in final_scores:
            #             final_scores[content] += score
            #       else:
            #             final_scores[content] = score

            #=========RETRIEVED RANK FUSION(RRF)===========

           
            final_scores = {}

            #SEMANTIC RANKING
            for rank, idx in enumerate(semantic_indicies, start = 1):
                  score = SEMANTIC_WEIGHT * 1/ (RRF_K + rank)
                  final_scores[idx] = final_scores.get(idx, 0) + score
            

            #BM25 KEYWORD RANKING
            for rank, idx in enumerate(top_indices, start = 1):
                  score = BM25_WEIGHT* 1/ (RRF_K + rank)
                  final_scores[idx] = final_scores.get(idx, 0) + score

                  
            sorted_docs = sorted(
                  final_scores.items(),
                  key = lambda x: x[1],
                  reverse=True
            )

            return [self.chunks[idx] for idx, _ in sorted_docs[:self.top_k]]

            