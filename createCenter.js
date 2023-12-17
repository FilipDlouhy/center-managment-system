function generateRandomName() {
  const firstNameLength = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
  const lastNameLength = Math.floor(Math.random() * (10 - 5 + 1)) + 5;

  const firstName = Array.from({ length: firstNameLength }, () =>
    Math.random().toString(36).charAt(2)
  ).join("");

  const lastName = Array.from({ length: lastNameLength }, () =>
    Math.random().toString(36).charAt(2)
  ).join("");

  const randomName = `${firstName} ${lastName}`;

  return randomName;
}
const centers = [];
for (let index = 0; index < 1; index++) {
  centers.push({
    name: generateRandomName(),
  });
}
const url = "http://localhost/api/";
const createCenterEndpoint = `${url}center/create-center`;
const postRequest = async (endpoint, data) => {
  try {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
    const response = await fetch(endpoint, requestOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error posting to ${endpoint}:`, error);
  }
};
const createCenters = async () => {
  for (const center of centers) {
    await postRequest(createCenterEndpoint, center);
  }
};

createCenters();
