export default function MeetingRoomCard({ name, onDelete }: { name: string; onDelete: () => void }) {
    return (
        <div className="card bg-base-100 w-96 shadow-xl m-4">
            
            <div className="card-body">
                <h2 className="card-title">{name}</h2>
                <div className="card-actions justify-end">
                    <button className="btn btn-error" onClick={onDelete}>Delete</button>
                </div>
            </div>
        </div>
    );
}