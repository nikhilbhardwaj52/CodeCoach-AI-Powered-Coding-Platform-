const OpenAI = require("openai");

const client = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY,
});

const solveDoubt = async (req, res) => {

    try {

        const {
            messages,
            title,
            description,
            testCases,
            startCode
        } = req.body;

        // Convert Gemini format -> OpenAI format
        const formattedMessages = messages.map((msg) => ({
            role:
                msg.role === "model"
                    ? "assistant"
                    : msg.role,

            content: msg.parts[0].text
        }));

        const completion =
            await client.chat.completions.create({

                model: "llama-3.1-8b-instant",

                messages: [

                    {
                        role: "system",

                        content: `
You are an expert DSA tutor.

Problem Title:
${title}

Problem Description:
${description}

Test Cases:
${JSON.stringify(testCases)}

Starter Code:
${startCode}

Only answer DSA and coding questions.
`
                    },

                    ...formattedMessages
                ]
            });

        return res.status(200).json({

            success: true,

            answer:
                completion
                    .choices[0]
                    .message
                    .content
        });

    } catch (err) {

        console.error(
            "GROQ ERROR =>",
            err.response?.data || err
        );

        return res.status(500).json({

            success: false,

            message:
                err.response?.data?.error?.message ||
                err.message ||
                "Internal Server Error"
        });
    }
};

module.exports = solveDoubt;