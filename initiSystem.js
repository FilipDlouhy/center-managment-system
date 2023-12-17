function generateRandomEmail() {
  const usernameLength = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
  const domainLength = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
  const topLevelDomains = ["com", "net", "org", "gov", "edu"];
  const randomTLD =
    topLevelDomains[Math.floor(Math.random() * topLevelDomains.length)];

  const username = Array.from({ length: usernameLength }, () =>
    Math.random().toString(36).charAt(2)
  ).join("");

  const domain = Array.from({ length: domainLength }, () =>
    Math.random().toString(36).charAt(2)
  ).join("");

  const email = `${username}@${domain}.${randomTLD}`;

  return email;
}

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
function generateRandomDescription() {
  const descriptionLength = Math.floor(Math.random() * 51) + 50;

  const description = Array.from({ length: descriptionLength }, () =>
    Math.random().toString(36).charAt(2)
  ).join("");

  return description;
}

const users = [
  {
    name: "Admin",
    email: "admin@admin.com",
    password: "1234",
    admin: true,
  },
];

const tasks = [];
const centers = [];

for (let index = 0; index < 200; index++) {
  users.unshift({
    name: generateRandomName(),
    email: generateRandomEmail(),
    password: "1234",
    admin: false,
  });
}
for (let index = 0; index < 2; index++) {
  centers.push({
    name: generateRandomName(),
  });
}
for (let index = 0; index < 200; index++) {
  tasks.push({
    description: generateRandomDescription(),
    userId: "",
  });
}

// Example usage:
const randomDescription = generateRandomDescription();

const url = "http://localhost/api/";
const createCenterEndpoint = `${url}center/create-center`;
const createUserEndpoint = `${url}user/create-user`;
const createtaskEndpoint = `${url}task/create-task`;

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

const initSystemData = async () => {
  for (const center of centers) {
    await postRequest(createCenterEndpoint, center);
  }

  for (let i = 0; i < users.length; i++) {
    const userData = await postRequest(createUserEndpoint, users[i]);
    if (userData && userData.id && i < tasks.length) {
      await postRequest(createtaskEndpoint, {
        ...tasks[i],
        userId: userData.id,
      });
    }
  }
};

initSystemData();
