#include "escrow.hpp"

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

  //transfer HEY to escrow
  eosio::action(
    permission_level{ _self, N(active) },
    N(pay), N(transferto),
    std::make_tuple(client, _self, escrow)
  ).send();

  //transfer HMR to escrow
  eosio::action(
    permission_level{ _self, N(active) },
    N(reputation), N(transferto),
    std::make_tuple(worker, _self, escrow)
  ).send();
}

//@abi action
void escrow::release(uint64_t id)
{
  require_auth(_self);

  jobs_index jobs(_self, _self);
  const auto& found_job = jobs.get(id, "no job object found");
  eosio_assert(!found_job.complete, "job is already completed");

  jobs.modify(found_job, _self, [&](auto& job){
    job.complete = true;
    job.success = true;
  });
  
  //Call HEY transfer to the worker
  eosio::action(
    permission_level{ _self, N(active) },
    N(pay), N(transfer),
    std::make_tuple(_self, found_job.worker, found_job.escrow)
  ).send();
  //Call HMR burn for the worker
  eosio::action(
    permission_level{ _self, N(active) },
    N(reputation), N(burn),
    std::make_tuple(_self, found_job.worker, found_job.reputation) //account_name owner, uint64_t amount
  ).send();
}

//@abi action
void escrow::refund(uint64_t id)
{
  require_auth(_self);

  jobs_index jobs(_self, _self);
  const auto& found_job = jobs.get(id, "no job object found");
  eosio_assert(!found_job.complete, "job is already completed");

  jobs.modify(found_job, _self, [&](auto& job){
    job.complete = true;
  });

  //Call HEY transfer back to the client
  eosio::action(
    permission_level{ _self, N(active) },
    N(pay), N(transfer),
    std::make_tuple(_self, found_job.client, found_job.escrow)
  ).send();
  //Call HMR burn for the worker
  eosio::action(
    permission_level{ _self, N(active) },
    N(reputation), N(burn),
    std::make_tuple(_self, found_job.worker, found_job.reputation) //account_name owner, uint64_t amount
  ).send();
}

} /// namespace heymate

EOSIO_ABI(heymate::escrow, (create)(release)(refund))
