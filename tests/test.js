const path = require('path');
const fs = require('fs');

const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const Influx = require('influx');
const influx = new Influx.InfluxDB('http://localhost:8086/metrics')

// To reject expired TLS certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const reporterURL = "http://localhost:8081/api/v4";
const registryURL = "http://localhost:8082/api/v6";

let testAgreement;

// Create Agreement
describe('Create agreement, calculate guarantees and delete agreement: ', () => {
  before((done) => {
    // Read the template
    fs.readFile(path.join(__dirname, '/testTemplate.json'), 'utf-8', (err, data) => {
      if (err) {
        done(err);
      }
      testAgreement = JSON.parse(data);

      // Delete and check the agreement does not exist already
      chai.request(registryURL)
        .delete("/agreements/" + testAgreement.id)
        .then(response => {
          chai.request(registryURL)
            .get("/agreements/" + testAgreement.id)
            .then(response => {
              // Check the agreement does not exist
              assert.equal(response.status, 404, 'The agreement should not exist at the beginning');
              done();
            }).catch(err => {
              done(err);
            });
        }).catch(err => {
          done(err);
        })
    });
  });

  it('should successfully create an agreement', (done) => {
    // Send to update points
    chai.request(registryURL)
      .post("/agreements")
      .send(testAgreement)
      .then(response => {
        // Check the response is successful
        assert.equal(response.status, 200, 'The agreement creation must be successful');

        // Registry check
        chai.request(registryURL)
          .get("/agreements/" + testAgreement.id)
          .then(response => {
            // Check the response is successful
            assert.equal(response.status, 200, 'The agreement must exist after the creation');

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
        assert.equal(response.status, 200, 'The points creation must end successful');
        // Database check
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
        assert.equal(response.status, 200, 'The DELETE request must be successful');

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