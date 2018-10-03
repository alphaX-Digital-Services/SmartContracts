#include "heymate.escrow.hpp"

namespace heymate {

//@abi action
void escrow::create(
  uint64_t id, 
  account_name client, 
  account_name worker, 
  uint64_t escrow, 
  uint64_t reputation
) {
  require_auth(_self);

  eosio_assert(is_account(client), "client account does not exist");
  eosio_assert(is_account(worker), "worker account does not exist");

  eosio_assert(0 < escrow && escrow < 1000 , "escrow should be more than 0 and less than 1000");
  eosio_assert(0 < reputation && reputation < 1000, "reputation should be more than 0 and less than 1000");

  jobs_index jobs(_self, _self);
  auto found_job = jobs.find(id);

  eosio_assert(found_job == jobs.end(), "job with such id already exists");

  jobs.emplace(_self, [&](auto& job){
    job.id = id;
    job.client = client;
    job.worker = worker;
    job.escrow = escrow;
    job.reputation = reputation;
    job.success = false;
    job.complete = false;
  });

  //TODO: call transferto for HEY and HMR tokens
  //TODO: call transferto for HMR tokens
}

//@abi action
void escrow::release(uint64_t id)
{
  require_auth(_self);

  jobs_index jobs(_self, _self);
  auto found_job = jobs.get(id, "no job object found");
  eosio_assert(!found_job.complete, "job is already completed");

  jobs.modify(found_job, _self, [&](auto& job){
    job.complete = true;
    job.success = true;
  });
  
  //TODO: call HEY transfer to the worker
  //TODO: call HMR burn for the worker
}

//@abi action
void escrow::refund(uint64_t id)
{
  require_auth(_self);

  jobs_index jobs(_self, _self);
  auto found_job = jobs.get(id, "no job object found");
  eosio_assert(!found_job.complete, "job is already completed");

  jobs.modify(found_job, _self, [&](auto& job){
    job.complete = true;
  });

  //TODO: call HEY transfer back to the client
  //TODO: call HMR burn for the worker
}

} /// namespace heymate

EOSIO_ABI(heymate::escrow, (create)(release)(refund))
