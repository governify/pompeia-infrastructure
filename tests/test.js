const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const Influx = require('influx');
const influx = new Influx.InfluxDB('http://localhost:8086/metrics')

// To reject expired TLS certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//const renderURL = "http://localhost:8080";
const reporterURL = "http://localhost:8081/api/v4";
const registryURL = "http://localhost:8082/api/v6";
const scopeManagerURL = "http://localhost:8083/api/v1"; // Used by collector
const assetsManagerURL = "http://localhost:8088/api/v1";
const directorURL = "http://localhost:8085/api/v1";
const eventCollectorURL = "http://localhost:8090/api/v2"; // Used by registry

//api/v1/private/scope-manager/scopes.json

let testAgreement;

const { exec } = require("child_process");

before((done) => {
  // Docker-compose up -d
  console.log('---------- Start E2E infrastructure ----------');
  exec("docker-compose -f tests/docker-compose-e2e.yaml pull", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      done(error);
    } else if (stderr) {
      console.log(`stderr: ${stderr}`);
    } else {
      console.log(`stdout: ${stdout}`);
    }
    exec("docker-compose -f tests/docker-compose-e2e.yaml up -d", (error1, stdout1, stderr1) => {
      if (error1) {
        console.log(`error: ${error1.message}`);
        done(error1);
      } else if (stderr) {
        console.log(`stderr: ${stderr1}`);
      } else {
        console.log(`stdout: ${stdout1}`);
      }

      // Fetch the template from Assets Manager checking env variables substitution
      chai.request(assetsManagerURL)
        .get("/public/testTemplate.json")
        .then(response => {
          testAgreement = JSON.parse(response.text);

          // Delete and check the agreement does not exist already
          setTimeout(() => {
            chai.request(registryURL)
              .delete("/agreements/" + testAgreement.id)
              .then(response => {
                chai.request(registryURL)
                  .get("/agreements/" + testAgreement.id)
                  .then(response => {
                    // Check the agreement does not exist
                    assert.strictEqual(response.status, 404, 'The agreement should not exist at the beginning');
                    done();
                  }).catch(err => {
                    done(err);
                  });
              }).catch(err => {
                done(err);
              })
          }, 3000);
        }).catch(err => {
          done(err);
        });;
    });
  });
});

// Create Agreement
describe('Create agreement, calculate guarantees and delete agreement: ', () => {
  it('should successfully create an agreement', (done) => {
    // Send to update points
    chai.request(registryURL)
      .post("/agreements")
      .send(testAgreement)
      .then(response => {
        // Check the response is successful
        assert.strictEqual(response.status, 200, 'The agreement creation must be successful');

        // Registry check
        chai.request(registryURL)
          .get("/agreements/" + testAgreement.id)
          .then(response => {

            // Check the response is successful
            assert.strictEqual(response.status, 200, 'The agreement must exist after the creation');

            // Remove inserted registry values to compare
            let responseTrimmed = { ...response.body };
            delete responseTrimmed._id;
            delete responseTrimmed.__v;

            // Compare template with registry one
            assert.deepStrictEqual(responseTrimmed, testAgreement, 'The agreement must match the template');
            done();
          }).catch(err => {
            done(err);
          });
      }).catch(err => {
        done(err);
      });
  });

  it('should compute agreement periods', (done) => {
    // Send to update points
    chai.request(reporterURL)
      .post('/contracts/' + testAgreement.id + '/createPointsFromPeriods')
      .send({ periods: [{ from: "2020-04-27T00:00:00Z", to: "2020-04-27T23:59:00Z" }] })
      .then(response => {
        // Check the response is successful
        assert.strictEqual(response.status, 200, 'The points creation must end successful');
        // Database check
        setTimeout(() => {
          influx.queryRaw('SELECT "guaranteeValue" FROM "autogen"."metrics_values" WHERE "agreement" = \'' + testAgreement.id + '\'').then(result => {
            assert.deepStrictEqual(result.results,
              [{ "statement_id": 0, "series": [{ "name": "metrics_values", "columns": ["time", "guaranteeValue"], "values": [["2020-04-27T00:00:00Z", 33.33333333333333]] }] }],
              'The data in influx must be correct');

            // Delete influx inserted points
            influx.queryRaw('DROP SERIES FROM "metrics_values" WHERE "agreement" = \'' + testAgreement.id + '\'').then(() => {
              // Check it was deleted
              influx.queryRaw('SELECT "guaranteeValue" FROM "autogen"."metrics_values" WHERE "agreement" = \'' + testAgreement.id + '\'').then(result2 => {
                assert.deepStrictEqual(result2, { "results": [{ "statement_id": 0 }] }, 'The data in influx must have been deleted');
                // End this test
                done();
              }).catch(err => {
                done(err);
              });
            }).catch(err => {
              done(err);
            });
          }).catch(err => {
            done(err);
          });
        }, 3000);
      }).catch(err => {
        done(err);
      });
  });

  it('should successfully delete the agreement', (done) => {
    // Send to update points
    chai.request(registryURL)
      .delete("/agreements/" + testAgreement.id)
      .then(response => {
        // Check the response is successful
        assert.strictEqual(response.status, 200, 'The DELETE request must be successful');

        // Registry check
        chai.request(registryURL)
          .get("/agreements/" + testAgreement.id)
          .then(response => {
            // Check the agreement does not exist
            assert.equal(response.status, 404, 'The agreement must no longer exist in the registry');
            done();
          }).catch(err => {
            done(err);
          });
      }).catch(err => {
        done(err);
      });
  });
});

after((done) => {
  // Docker-compose down
  console.log('---------- Stop E2E infrastructure ----------');
  exec("docker-compose -f tests/docker-compose-e2e.yaml down", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      done(error);
    } else if (stderr) {
      console.log(`stderr: ${stderr}`);
    } else {
      console.log(`stdout: ${stdout}`);
    }
    done();
  });
});