export default function MeetingRoomCard({ name, onDelete }: { name: string; onDelete: () => void }) {
    return (
        <div className="card bg-base-100 w-96 shadow-xl m-4">
            <figure>
                <img
                    src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                    alt={name} />
            </figure>
            <div className="card-body">
                <h2 className="card-title">{name}</h2>
                <div className="card-actions justify-end">
                    <button className="btn btn-error" onClick={onDelete}>Delete</button>
                </div>
            </div>
        </div>
    );
}