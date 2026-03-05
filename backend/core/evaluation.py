def precision_at_k(retrieved_docs, relevant_docs, k):
      retrieved_text = [doc.page_content for doc in retrieved_docs[:k]]
      
      relevant_count = 0

      for doc in relevant_docs:
            if doc in retrieved_text:
                  relevant_count += 1
      

      return relevant_count/k


def mean_reciprocal_rank(retrieved_docs, relevant_docs):
      for rank, doc in enumerate(retrieved_docs, start= 1):
            if doc.page_content in relevant_docs:
                  return 1/rank
      
      return 0


def evaluate_system(retriever, evaluation_data, k = 5):
      total_precision = 0
      total_mmr = 0

      for item in evaluation_data:
            query = item["query"]
            relevant_docs = item["relevant_docs"]

            retrieved_docs = retriever.retrieve(query)

            total_precision += precision_at_k(retrieved_docs=retrieved_docs, relevant_docs=relevant_docs, k= k)
            total_mmr += mean_reciprocal_rank(retrieved_docs=retrieved_docs, relevant_docs=relevant_docs)

      avg_precision = total_precision/len(evaluation_data)
      avg_mmr = total_mmr/len(evaluation_data)


      print(f"Average Precision = {avg_precision: .4f}")
      print(f"Average MMR = {avg_mmr: .4f}")