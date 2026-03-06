class ConversationMemory:
      def __init__(self, max_turns = 5):
            self.max_turns = max_turns
            self.history = []
      
      def add(self, user, assistant):
            self.history.append(
                 { 
                        "user": user, 
                        "assistant": assistant
                  }
            )
            if len(self.history) > self.max_turns:
                  self.history.pop(0)

      def get_context(self):
            context = ""

            for turn in self.history:
                  context += f"User: {turn['user']}\n"
                  context += f"Assistant : {turn['assistant']}\n"
            

            return context