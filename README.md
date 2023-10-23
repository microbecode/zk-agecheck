# ZK age check

This project is for enabling functionality to check a user's age in a website, with Zero Knowledge technology.

The project utilizes Mina ZK blockchain for generating ZK proofs and verifying them.

This project is currently under heavy construction. A lot of the documented functionality is not there yet.

## Pieces of the puzzle

Below is a general overview of the process. Each piece is described in more detail.

<img src='agecheck.png'>

### A website

A dummy website, which prompts the user to verify their age.

Later in the process, the website asks the Mina blockchain to verify a provided proof.

### Mina blockchain

A circuit (program) is written in the Mina blockchain, which does the following:

1. Receive a signed message from a KYC provider. Verify the signature and generate a proof for the data
1. Verify a received proof, along with the claimed data

### KYC provider

This is a mocked KYC provider. It's a service which accepts an identity document (or, a mock of one), extracts requested data from it and sends back the data in a signed message.

### User's browser

Used as a coordinator in the process, and to eventually access the website.

## How to build

```sh
npm run build
```

## How to run tests

```sh
npm run test
npm run testw # watch mode
```

## How to run coverage

```sh
npm run coverage
```

## License

[Apache-2.0](LICENSE)
