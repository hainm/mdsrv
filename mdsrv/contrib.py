import array
import numpy as np
import pytraj

class BaseRemoteTrajectory(object):
    def get(self, path):
        raise NotImplementedError

    def get_frame_string(self, index, **kwargs):
        raise NotImplementedError

    def get_path(self, atom_index, frame_indices):
        raise NotImplementedError

    def get_path_string(self, atom_index, frame_indices=None):
        raise NotImplementedError

class RemoteTrajectoryIterator(BaseRemoteTrajectory, pytraj.TrajectoryIterator):

    count = 0
    def get(self, path):
        if self.count == 0:
            self._load(path)
            self.count += 1

        return self

    def get_frame_string(self, index, **kwargs):

        frame = self[index]
        return (
            array.array("i", [self.n_frames, ]).tobytes() +
            array.array("f", [frame.time, ]).tobytes() +
            array.array("f", frame.box.to_recip()[0].flatten()).tobytes() +
            array.array("f", frame.xyz.flatten()).tobytes()
        )

    def get_path(self, atom_index, frame_indices=None):
        if frame_indices is not None:
            size = len(frame_indices)
            frame_indices = map(int, frame_indices)
        else:
            size = self.n_frames
            frame_indices  = range(size)

        path = np.zeros((size, 3), dtype=np.float32 )

        for i in frame_indices:
            frame = self[i]
            box = frame.box.to_recip()
            time = frame.time
            coords = frame.xyz
            path[i] = coords[atom_index]
        return path

    def get_path_string(self, atom_index, frame_indices=None):
        path = self.get_path( atom_index, frame_indices=frame_indices )
        return array.array( "f", path.flatten() ).tostring()
