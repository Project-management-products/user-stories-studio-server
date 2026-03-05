async function test() {
    const payload = {
        projectId: "user-stories-studio",
        email: "test@example.com",
        prompt: "Generar historia de usuario para un sistema de login con biometría",
        context: "Aplicación móvil de banca segura",
        provider: "google"
    };

    try {
        console.log("Testing Unified AI Gateway...");
        const response = await fetch("http://localhost:3000/api/generate-story", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Test failed:", error);
    }
}

test();
