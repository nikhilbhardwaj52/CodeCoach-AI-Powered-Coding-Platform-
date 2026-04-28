const fetch = require('node-fetch');  // Add this line at the top

const solveDoubt = async (req, res) => {
    try {
        const { messages, title, description } = req.body;

        console.log("📥 AI Request for:", title);

        // Check API key
        if (!process.env.GEMINI_KEY) {
            console.error("❌ GEMINI_KEY missing!");
            return res.status(200).json({
                success: true,
                message: "💡 **Hint:** Try adding the two numbers and returning the sum!"
            });
        }

        // Get user's question
        let userQuestion = "Can you help me with this problem?";
        if (messages && messages.length > 0) {
            userQuestion = messages[messages.length - 1].content || userQuestion;
        }

        // Create prompt
        const prompt = `You are a helpful DSA tutor.

PROBLEM: ${title}
DESCRIPTION: ${description}

Student asks: "${userQuestion}"

Give a short, helpful hint (2-3 sentences maximum). Be encouraging. Do NOT give complete code.`;

        console.log("📤 Calling Gemini API...");

        // REST API call
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_KEY}`;
        
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 150
                }
            })
        });

        const data = await response.json();
        
        let aiResponse = "💡 **Hint:** Try to understand the input-output pattern from the examples!";
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            aiResponse = data.candidates[0].content.parts[0].text;
            console.log("✅ AI Response received");
        } else if (data.error) {
            console.error("API Error:", data.error.message);
        }

        res.status(200).json({
            success: true,
            message: aiResponse
        });

    } catch (err) {
        console.error("❌ Error:", err.message);
        
        // Always return a helpful fallback
        res.status(200).json({
            success: true,
            message: "💡 **Hint:** Read the input values, add them together, and print the result!"
        });
    }
};

module.exports = solveDoubt;