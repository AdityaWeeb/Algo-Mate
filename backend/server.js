const express = require('express');
const app= express();
const PORT=5000;

app.use(express.json());

app.post('/api/analyze', async(req,res) =>{
    const {codesnippet} =req.body;
    
    const prompt = `Analyze the following code snippet and provide :
                        1.Time Complexity
                        2.Space Complexity
                        3.Suggestions for optimising the code
                        Code:
                        ${codesnippet}`
    
    try {
            const response = await fetch('https://chromeai.googleapis.com/rewrite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
            });
            const data = await response.json();
            res.json({ result: data.output });
    } catch (error) {
            console.error('Error analyzing code:', error);
            res.status(500).send('Internal Server Error');
    }

});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));