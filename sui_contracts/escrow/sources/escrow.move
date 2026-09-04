module equisettle::escrow {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Coin};
    use sui::clock::{Self, Clock};
    use sui::event;

    // === Errors ===
    const ENotAuthorized: u64 = 0;
    const EEpochNotReached: u64 = 1;
    const EEscrowAlreadyReleased: u64 = 2;

    // === Structs ===

    /// A programmable escrow object that locks a specific Coin type
    public struct TimeLockedEscrow<phantom T> has key, store {
        id: UID,
        creator: address,
        recipient: address,
        locked_funds: Coin<T>,
        unlock_time_ms: u64,
        is_released: bool
    }

    /// Event emitted when an escrow is created
    public struct EscrowCreated has copy, drop {
        escrow_id: address,
        creator: address,
        recipient: address,
        unlock_time_ms: u64
    }

    /// Event emitted when funds are released
    public struct EscrowReleased has copy, drop {
        escrow_id: address,
        recipient: address
    }

    // === Public Functions ===

    /// Creates a new time-locked escrow.
    /// The funds are locked inside the returned TimeLockedEscrow object.
    /// In a real app, this object is shared or transferred to a neutral party/recipient.
    public fun create_escrow<T>(
        payment: Coin<T>, 
        recipient: address, 
        unlock_time_ms: u64, 
        ctx: &mut TxContext
    ) {
        let escrow_uid = object::new(ctx);
        
        event::emit(EscrowCreated {
            escrow_id: object::uid_to_address(&escrow_uid),
            creator: tx_context::sender(ctx),
            recipient: recipient,
            unlock_time_ms: unlock_time_ms
        });

        let escrow = TimeLockedEscrow {
            id: escrow_uid,
            creator: tx_context::sender(ctx),
            recipient: recipient,
            locked_funds: payment,
            unlock_time_ms: unlock_time_ms,
            is_released: false
        };

        // Transfer the escrow object to the recipient so they can release it when time is up
        transfer::transfer(escrow, recipient);
    }

    /// Releases the funds to the recipient if the unlock time has passed.
    public fun release_funds<T>(
        escrow: TimeLockedEscrow<T>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        
        // Ensure the time lock has expired
        assert!(current_time >= escrow.unlock_time_ms, EEpochNotReached);
        assert!(!escrow.is_released, EEscrowAlreadyReleased);
        assert!(tx_context::sender(ctx) == escrow.recipient || tx_context::sender(ctx) == escrow.creator, ENotAuthorized);

        // Deconstruct the escrow object
        let TimeLockedEscrow { id, creator: _, recipient, locked_funds, unlock_time_ms: _, is_released: _ } = escrow;

        event::emit(EscrowReleased {
            escrow_id: object::uid_to_address(&id),
            recipient: recipient
        });

        // Delete the UID
        object::delete(id);

        // Transfer the actual coin to the recipient
        transfer::public_transfer(locked_funds, recipient);
    }
}
