import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("NumberGuessingModule", (m) => {
  const numberGuessing = m.contract("NumberGuessing");

  m.call(numberGuessing, "setNumber", [42n]);

  return { numberGuessing };
});
