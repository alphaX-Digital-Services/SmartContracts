#pragma once

#include <eosiolib/eosio.hpp>

using namespace eosio;

namespace heymate {

  class escrow : public contract {
    public:
      escrow(account_name self):contract(self){}

      void create(
        uint64_t id, 
        account_name client, 
        account_name worker, 
        uint64_t escrow, 
        uint64_t reputation
      );

      void release(uint64_t id);

      void refund(uint64_t id);

    private:
      //@abi table jobs i64
      struct job {
        uint64_t id;
        account_name client;
        account_name worker;
        uint64_t escrow;
        uint64_t reputation;
        bool success;
        bool complete;

        uint64_t primary_key()const { return id; }

        EOSLIB_SERIALIZE(job, (id)(client)(worker)(escrow)(reputation)(success)(complete));
      };

      typedef eosio::multi_index<N(jobs), job> jobs_index;
   };
} /// namespace heymate
