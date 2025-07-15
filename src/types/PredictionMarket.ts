/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/prediction_market.json`.
 */
export type PredictionMarket = {
  address: '6zMNJsDNbL4N8L9KfLtvgbwRpwEu233C22ujyRqFrS1W';
  metadata: {
    name: 'predictionMarket';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'nextmate prediction market program';
  };
  instructions: [
    {
      name: 'configServiceFee';
      discriminator: [53, 134, 225, 186, 241, 107, 42, 177];
      accounts: [
        {
          name: 'marketState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101,
                ];
              },
            ];
          };
        },
        {
          name: 'authority';
          signer: true;
        },
      ];
      args: [
        {
          name: 'newFeeReceiver';
          type: 'pubkey';
        },
      ];
    },
    {
      name: 'configSigner';
      discriminator: [154, 169, 74, 45, 196, 23, 85, 213];
      accounts: [
        {
          name: 'marketState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101,
                ];
              },
            ];
          };
        },
        {
          name: 'authority';
          signer: true;
        },
      ];
      args: [
        {
          name: 'newSigner';
          type: 'pubkey';
        },
      ];
    },
    {
      name: 'initialize';
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: 'marketState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101,
                ];
              },
            ];
          };
        },
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [];
    },
    {
      name: 'placeVote';
      discriminator: [95, 34, 235, 31, 136, 43, 28, 223];
      accounts: [
        {
          name: 'marketState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101,
                ];
              },
            ];
          };
        },
        {
          name: 'voter';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'instructions';
          docs: ['Instructions sysvar'];
        },
      ];
      args: [
        {
          name: 'voteId';
          type: 'string';
        },
        {
          name: 'lamports';
          type: 'u64';
        },
        {
          name: 'expireTimestamp';
          type: 'i64';
        },
        {
          name: 'signature';
          type: {
            array: ['u8', 64];
          };
        },
      ];
    },
    {
      name: 'withdraw';
      discriminator: [183, 18, 70, 156, 148, 109, 161, 34];
      accounts: [
        {
          name: 'marketState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101,
                ];
              },
            ];
          };
        },
        {
          name: 'claimInfo';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [99, 108, 97, 105, 109, 95, 105, 110, 102, 111];
              },
              {
                kind: 'arg';
                path: 'claimId';
              },
            ];
          };
        },
        {
          name: 'claimer';
          writable: true;
          signer: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'instructions';
          docs: ['Instructions sysvar'];
        },
      ];
      args: [
        {
          name: 'claimId';
          type: 'string';
        },
        {
          name: 'lamports';
          type: 'u64';
        },
        {
          name: 'expireTimestamp';
          type: 'i64';
        },
        {
          name: 'signature';
          type: {
            array: ['u8', 64];
          };
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'claimInfo';
      discriminator: [129, 190, 22, 157, 235, 64, 38, 111];
    },
    {
      name: 'marketState';
      discriminator: [0, 125, 123, 215, 95, 96, 164, 194];
    },
  ];
  events: [
    {
      name: 'voteEvent';
      discriminator: [195, 71, 250, 105, 120, 119, 234, 134];
    },
    {
      name: 'withdrawEvent';
      discriminator: [22, 9, 133, 26, 160, 44, 71, 192];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'unauthorized';
      msg: 'Unauthorized access';
    },
    {
      code: 6001;
      name: 'invalidParameters';
      msg: 'Invalid parameters';
    },
    {
      code: 6002;
      name: 'invalidValue';
      msg: 'Invalid value';
    },
    {
      code: 6003;
      name: 'invalidSignature';
      msg: 'Invalid signature';
    },
    {
      code: 6004;
      name: 'outOfVotePeriod';
      msg: 'Out of vote period';
    },
    {
      code: 6005;
      name: 'claimExpired';
      msg: 'Claim is expired';
    },
    {
      code: 6006;
      name: 'alreadyClaimed';
      msg: 'Claim already processed';
    },
    {
      code: 6007;
      name: 'insufficientBalance';
      msg: 'Insufficient balance';
    },
    {
      code: 6008;
      name: 'missingEd25519Instruction';
      msg: 'Missing Ed25519 instruction';
    },
    {
      code: 6009;
      name: 'invalidEd25519Instruction';
      msg: 'Invalid Ed25519 instruction';
    },
    {
      code: 6010;
      name: 'invalidPublicKey';
      msg: 'Invalid public key';
    },
    {
      code: 6011;
      name: 'invalidMessage';
      msg: 'Invalid message';
    },
  ];
  types: [
    {
      name: 'claimInfo';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'used';
            type: 'bool';
          },
          {
            name: 'timestamp';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'marketState';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'owner';
            type: 'pubkey';
          },
          {
            name: 'signer';
            type: 'pubkey';
          },
          {
            name: 'serviceFeeReceiver';
            type: 'pubkey';
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'voteEvent';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'voteId';
            type: 'string';
          },
          {
            name: 'voter';
            type: 'pubkey';
          },
          {
            name: 'lamports';
            type: 'u64';
          },
          {
            name: 'timestamp';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'withdrawEvent';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'claimId';
            type: 'string';
          },
          {
            name: 'claimer';
            type: 'pubkey';
          },
          {
            name: 'lamports';
            type: 'u64';
          },
          {
            name: 'timestamp';
            type: 'i64';
          },
        ];
      };
    },
  ];
};
