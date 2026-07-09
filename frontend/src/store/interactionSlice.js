import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/api";

const initialInteraction = {
  hcp_name: "",
  interaction_type: "Meeting",
  interaction_date: "",
  interaction_time: "",
  attendees: "",
  topics_discussed: "",
  materials_shared: "",
  samples_distributed: "",
  sentiment: "",
  outcomes: "",
  follow_up_actions: "",
};

export const sendChatMessage = createAsyncThunk(
  "interaction/sendChatMessage",
  async (message, { getState, rejectWithValue }) => {
    try {
      const interaction = getState().interaction.formData;

      const response = await api.post("/chat", {
        message,
        interaction,
      });

      return {
        ...response.data,
        userMessage: message,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Unable to contact AI assistant."
      );
    }
  }
);

const interactionSlice = createSlice({
  name: "interaction",

  initialState: {
    formData: initialInteraction,
    messages: [
      {
        role: "assistant",
        content:
          'Log interaction details here (e.g., "Met Dr. Smith, discussed Product X efficacy, positive sentiment, shared brochure") or ask for help.',
      },
    ],
    activeTool: "",
    savedInteractionId: null,
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        state.messages.push({
          role: "user",
          content: action.meta.arg,
        });
      })

      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;

        state.formData = {
          ...state.formData,
          ...action.payload.interaction,
        };

        state.activeTool = action.payload.active_tool;
        state.savedInteractionId =
          action.payload.saved_interaction_id;

        state.messages.push({
          role: "assistant",
          content: action.payload.reply,
        });
      })

      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

        state.messages.push({
          role: "assistant",
          content:
            typeof action.payload === "string"
              ? action.payload
              : "Something went wrong while processing the interaction.",
        });
      });
  },
});

export default interactionSlice.reducer;