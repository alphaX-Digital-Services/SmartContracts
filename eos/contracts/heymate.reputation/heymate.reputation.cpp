#include "heymate.reputation.hpp"

namespace heymate {

void reputation::mint(account_name owner, uint64_t amount)
{
  require_auth(_self);
  eosio_assert(is_account(owner), "owner account does not exist");

  add_balance(owner, value);
}

void reputation::burn(account_name owner, unit64_t amount)
{
  require_auth(_self);
  eosio_assert(is_account(owner), "owner account does not exist");

  sub_balance(owner, amount);
}

void approve(account_name owner, account_name spender, unit64_t amount)
{
  require_auth(owner);
  eosio_assert(is_account(spender), "spender account does not exist");
  eosio_assert(amount > 0, "amount should be higher than zero");

  allowances_index allowances(_self, _self);

  aout found_allowance = allowances.find();
}

void reputation::sub_balance(account_name owner, uint64_t value) 
{
  accounts_index accounts(_self, _self);

  const auto& found_account = accounts.get(owner, "no balance object found");
  eosio_assert(found_account.balance >= value, "overdrawn balance");

  if(found_account.balance == value) {
    found_account.erase(from);
  } else {
    accounts.modify(found_account, _self, [&](auto& a) {
      a.balance -= value;
    });
  }
}

void reputation::add_balance(account_name owner, uint64_t value)
{
  accounts_index accounts(_self, _self);
  auto found_account = accounts.find(owner);

  if(found_account == accounts.end()) {
    accounts.emplace(_self, [&](auto& account){
      account.holder = owner;
      account.balance = value;
    });
  } else {
    accounts.modify(owner, _self, [&](auto& account) {
      account.balance += value;
    });
  }
}

// void token::create( account_name issuer,
//                     asset        maximum_supply )
// {
//     require_auth( _self );

//     auto sym = maximum_supply.symbol;
//     eosio_assert( sym.is_valid(), "invalid symbol name" );
//     eosio_assert( maximum_supply.is_valid(), "invalid supply");
//     eosio_assert( maximum_supply.amount > 0, "max-supply must be positive");

//     stats statstable( _self, sym.name() );
//     auto existing = statstable.find( sym.name() );
//     eosio_assert( existing == statstable.end(), "token with symbol already exists" );

//     statstable.emplace( _self, [&]( auto& s ) {
//       s.supply.symbol = maximum_supply.symbol;
//       s.max_supply    = maximum_supply;
//       s.issuer        = issuer;
//     });
// }


void token::issue( account_name to, asset quantity, string memo )
{
    auto sym = quantity.symbol;
    eosio_assert( sym.is_valid(), "invalid symbol name" );
    eosio_assert( memo.size() <= 256, "memo has more than 256 bytes" );

    auto sym_name = sym.name();
    stats statstable( _self, sym_name );
    auto existing = statstable.find( sym_name );
    eosio_assert( existing != statstable.end(), "token with symbol does not exist, create token before issue" );
    const auto& st = *existing;

    require_auth( st.issuer );
    eosio_assert( quantity.is_valid(), "invalid quantity" );
    eosio_assert( quantity.amount > 0, "must issue positive quantity" );

    eosio_assert( quantity.symbol == st.supply.symbol, "symbol precision mismatch" );
    eosio_assert( quantity.amount <= st.max_supply.amount - st.supply.amount, "quantity exceeds available supply");

    statstable.modify( st, 0, [&]( auto& s ) {
      s.supply += quantity;
    });

    add_balance( st.issuer, quantity, st.issuer );

    if( to != st.issuer ) {
      SEND_INLINE_ACTION( *this, transfer, {st.issuer,N(active)}, {st.issuer, to, quantity, memo} );
    }
}

void token::transfer( account_name from,
                      account_name to,
                      asset        quantity,
                      string       memo )
{
    eosio_assert( from != to, "cannot transfer to self" );
    require_auth( from );
    eosio_assert( is_account( to ), "to account does not exist");
    auto sym = quantity.symbol.name();
    stats statstable( _self, sym );
    const auto& st = statstable.get( sym );

    require_recipient( from );
    require_recipient( to );

    eosio_assert( quantity.is_valid(), "invalid quantity" );
    eosio_assert( quantity.amount > 0, "must transfer positive quantity" );
    eosio_assert( quantity.symbol == st.supply.symbol, "symbol precision mismatch" );
    eosio_assert( memo.size() <= 256, "memo has more than 256 bytes" );


    sub_balance( from, quantity );
    add_balance( to, quantity, from );
}

} /// namespace heymate

EOSIO_ABI(heymate::reputation, (mint)(burn)(approve)(transfer_from))
