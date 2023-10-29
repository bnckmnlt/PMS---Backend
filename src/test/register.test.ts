import { request } from "graphql-request";
import { initializeServer } from "../initializeServer";
import { User } from "../entity/User";
import "dotenv/config";

beforeAll(async () => {
  await initializeServer();
});

const email = "seconduser@gmail.com";
const password = "secondpassword";

const registerMutation = `
  mutation {
    register(email: "${email}", password: "${password}")
  }
`;

const host = "http://localhost:5000";

test("Register a user", async () => {
  const response = await request(host, registerMutation);
  expect(response).toEqual({
    register: { status_code: 200, path: "success", message: "User stored" },
  });
});

test("Check if user has only one entry", async () => {
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
});

test("Check if stored user has the same email, password is encrypted", async () => {
  const users = await User.find({ where: { email } });
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
});
