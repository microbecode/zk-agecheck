# ZK age check

This project is for enabling functionality to check a user's age in a website, with Zero Knowledge technology. The project utilizes Mina ZK blockchain for generating ZK proofs and verifying them.

This project is currently under heavy construction. A lot of the documented functionality is not there yet.

The current version is a Proof of Concept, which utilizes a Mina circuit for verifying signed data. No KYC provider is added yet.

## Pieces of the puzzle

Below is a general overview of the process. Each piece is described in more detail.

<img src='agecheck.png'>

### A website

A restricted website that prompts the user to verify their age.

Later in the process the website asks the Mina circuit to verify a provided proof.

### Mina blockchain

A circuit (program) is written in the [o1js framework](https://github.com/o1-labs/o1js). The circuit does the following:

1. Receive a signed message from a KYC provider. Verify the signature and generate a proof for the data
1. Verify a received proof, along with the claimed data

### KYC provider

This is a mocked KYC provider. It's a service which accepts an identity document (or, a mock of one), extracts requested data from it and sends back the data in a signed message.

### User's browser

Used as a coordinator in the process, and to eventually access the website.

## Overall process

The overall process follows the following steps:

1. User wants to open a website. The website requires all users to prove that they are above certain age.
1. The website opens a separate KYC provider to an _iframe_.
1. The KYC provider is mocked in this project. The provider has their own frontend which is shown in the iframe.
1. User performs steps required by the provider. In this project the steps are uploading your mock ID to the provider. The mock ID is a .txt file. The file should contain only the user's age and nothing else. (You can, for example, just save a file with text "50" in it and submit this).
1. The KYC provider extracts the age information from the submitted document, creates a JSON message of it and signs it with their private key. The signed message is sent back to the user's browser, out of the iframe.
1. The user's browser forwards this message to a Mina ZkProgram. The ZkProgram verifies that the signature is valid and provides a proof for it.
1. The user can then submit this proof for the website for verification.
1. The website verifies this proof against the claimed age. If the proof verifies the age, the website forward the user to the main website.

## License

[Apache-2.0](LICENSE)
