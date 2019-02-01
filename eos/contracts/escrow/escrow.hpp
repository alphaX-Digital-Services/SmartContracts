#pragma once

#include <eosiolib/eosio.hpp>
#include <eosiolib/asset.hpp>
#include <eosiolib/symbol.hpp>
#include <eosiolib/print.hpp>
#include <eosiolib/system.h>
#include <string>

using namespace eosio;

namespace heymate {

  using std::string;
  using std::vector;

  enum statuses {
    undefined = 0,
    proposal,
    acceptedProposal,
    dealDenied,
    started,
    createEscrowPending,
    escrowProcessed,
    suspended,
    completePending,
    completed,
    applicationDenied,
    workerDeliveryConfirmed,
    clientDeliveryConfirmed,
    clientFeedbackSet,
    failPending,
    failed,
    archived,
    workerDeclined,
    clientWithdrawn
  } stat;

  CONTRACT escrow : public contract {
    using contract::contract;

    public:
      ACTION create(
        uint64_t id,
        name client,
        name worker,
        uint64_t escrow,
        uint64_t reputation
      );

      ACTION release(uint64_t id, uint64_t reputation);

      ACTION refund(uint64_t id, uint64_t cancellationLogic);

      ACTION status(uint64_t id, string status, string history);

    private:
      TABLE job {
        uint64_t id;
        name client;
        name worker;
        uint64_t escrow;
        uint64_t reputation;
        char status;
        bool success;
        bool complete;
        uint64_t created;
        uint64_t updated;
        vector<string> history;

        uint64_t primary_key() const { return id; }

        EOSLIB_SERIALIZE( job, (id)(client)(worker)(escrow)(reputation)(status)(success)(complete)(created)(updated)(history) )
      };

      typedef multi_index<"jobs"_n, job> jobs_index;

      void transfer_token(name client, uint64_t escrow);
      void mint_reputation(name worker, uint64_t amount);
      statuses convert(const string& str);
   };
} /// namespace heymate
