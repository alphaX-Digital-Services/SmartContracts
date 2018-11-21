#pragma once

#include <eosiolib/eosio.hpp>
#include <eosiolib/asset.hpp>
#include <eosiolib/symbol.hpp>

using namespace eosio;

namespace heymate {

  CONTRACT escrow : public contract {
    using contract::contract;

    public:
      ACTION create(
        uint64_t id,
        name client,
        name worker,
        float escrow,
        uint64_t reputation
      );

      ACTION release(uint64_t id, uint64_t reputation);

      ACTION refund(uint64_t id);

    private:
      TABLE job {
        uint64_t id;
        name client;
        name worker;
        float escrow;
        uint64_t reputation;
        bool success;
        bool complete;

        uint64_t primary_key() const { return id; }
      };

      typedef multi_index<"jobs"_n, job> jobs_index;
   };
} /// namespace heymate
